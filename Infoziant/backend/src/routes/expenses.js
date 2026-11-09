// src/routes/expenses.js — vehicle expenses management & financial analytics
'use strict';

const express = require('express');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const validateObjectId = require('../middleware/validateObjectId');
const { createError } = require('../middleware/errorHandler');
const { logActivity } = require('../services/activityService');

const router = express.Router();

// GET /api/expenses — list expenses with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const { vehicleId, category, startDate, endDate } = req.query;
    const filter = {};

    if (vehicleId) filter.vehicle = vehicleId;
    if (category && category !== 'ALL') filter.category = category;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter)
      .populate('vehicle', 'registrationNumber make model year')
      .sort({ date: -1 })
      .lean();

    const totalAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.json({
      count: expenses.length,
      totalAmount,
      expenses,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/analytics — aggregated statistics & charts data
router.get('/analytics', async (_req, res, next) => {
  try {
    const expenses = await Expense.find().populate('vehicle', 'registrationNumber make model').lean();

    const totalAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // 1. By Category breakdown
    const categoryMap = {};
    expenses.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      name: category,
      value: Math.round(amount),
    }));

    // 2. Monthly Trend (last 6 months)
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthMap[key] = 0;
    }

    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (monthMap[key] !== undefined) {
        monthMap[key] += e.amount;
      }
    });

    const monthlyTrend = Object.entries(monthMap).map(([month, total]) => ({
      month,
      total: Math.round(total),
    }));

    // 3. Per-Vehicle Breakdown
    const vehicleMap = {};
    expenses.forEach((e) => {
      const reg = e.vehicle?.registrationNumber || 'Unassigned';
      vehicleMap[reg] = (vehicleMap[reg] || 0) + e.amount;
    });

    const vehicleBreakdown = Object.entries(vehicleMap).map(([vehicle, total]) => ({
      vehicle,
      total: Math.round(total),
    }));

    res.json({
      totalExpenses: totalAmount,
      totalRecords: expenses.length,
      categoryBreakdown,
      monthlyTrend,
      vehicleBreakdown,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/expenses — record new expense
router.post('/', async (req, res, next) => {
  try {
    const {
      vehicleId,
      category,
      amount,
      date,
      paymentMethod,
      vendorOrStation,
      receiptNumber,
      fuelQuantityLiters,
      odometerReading,
      notes,
    } = req.body;

    if (!vehicleId || !category || amount === undefined) {
      return next(createError(400, 'vehicleId, category, and amount are required'));
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return next(createError(404, 'Vehicle not found'));

    const expense = new Expense({
      vehicle: vehicle._id,
      category,
      amount: Number(amount),
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Credit / Debit Card',
      vendorOrStation: vendorOrStation || '',
      receiptNumber: receiptNumber || '',
      fuelQuantityLiters: fuelQuantityLiters ? Number(fuelQuantityLiters) : null,
      odometerReading: odometerReading ? Number(odometerReading) : null,
      notes: notes || '',
    });

    await expense.save();
    await expense.populate('vehicle', 'registrationNumber make model year');

    await logActivity(
      'EXPENSE_CREATED',
      'Expense',
      expense._id,
      `${category} (Rs. ${amount})`,
      `Expense logged for ${vehicle.registrationNumber}`,
      { amount, category },
      req
    );

    res.status(201).json({ message: 'Expense recorded successfully', expense });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/expenses/:id — delete expense
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return next(createError(404, 'Expense not found'));

    await logActivity(
      'EXPENSE_DELETED',
      'Expense',
      expense._id,
      expense.category,
      `Deleted expense record of Rs. ${expense.amount}`,
      {},
      req
    );

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

