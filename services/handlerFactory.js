const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    if (req.body.active === true) {
      // eslint-disable-next-line no-unused-expressions
      req.body.active === false;
    }
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    // Trigger "remove" event when delete document
    document.save();
    res.status(204).json();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    // Trigger "save" event when update document
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, optionPopulation) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (optionPopulation) {
      query = query.populate(optionPopulation);
    }
    const document = await query;
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelNam = '') =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .pagination(documentsCounts)
      .filter()
      .search(modelNam)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ result: documents.length, paginationResult, data: documents });
  });
