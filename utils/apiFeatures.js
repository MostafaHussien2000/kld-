class ApiFeatures {
  constructor(mongooseQuery, queryStr) {
    this.mongooseQuery = mongooseQuery;
    this.queryStr = queryStr;
  }

  // 1) Filtering
  filter() {
    const queryStringObj = { ...this.queryStr };
    const excludersFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excludersFields.forEach((field) => delete queryStringObj[field]);

    // Apply filtration using [gte, gt, lte, lt]
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  // 2) Sorting
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-creatAt');
    }

    return this;
  }

  // 3) Fields Limiting
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }

    return this;
  }

  // 4) Filter by colors
  filterByColors() {
    if (this.queryStr.colors) {
      const colors = this.queryStr.colors.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.find({ colors: { $in: colors } });
    }
    return this;
  }

  // 5) Search
  search(modelName) {
    if (this.queryStr.keyword) {
      let query = {};
      if (modelName === 'Product') {
        query.$or = [
          { title: { $regex: this.queryStr.keyword, $options: 'i' } },
          { description: { $regex: this.queryStr.keyword, $options: 'i' } },
        ];
      } else {
        query = { name: { $regex: this.queryStr.keyword, $options: 'i' } };
      }
      this.mongooseQuery = this.mongooseQuery.find(query);
    }

    return this;
  }

  // 6) Pagination
  pagination(countDocuments) {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    // next page
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }

    // previous page
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
