const asyncHandler = require('./asyncHandler');

// Builds standard CRUD handlers for a Mongoose model.
// options: { populate: [...], sort: '...', searchFields: [...] }
function crudFactory(Model, options = {}) {
  const { populate = [], sort = '-createdAt', searchFields = [] } = options;

  const applyPopulate = (query) => populate.reduce((q, p) => q.populate(p), query);

  const list = asyncHandler(async (req, res) => {
    const filter = {};
    // Exact-match filters passed as query params matching schema paths.
    Object.keys(req.query).forEach((key) => {
      if (key === 'search' || key === 'sort') return;
      if (Model.schema.paths[key]) filter[key] = req.query[key];
    });
    // Text search across configured fields.
    if (req.query.search && searchFields.length) {
      const rx = new RegExp(req.query.search.trim(), 'i');
      filter.$or = searchFields.map((f) => ({ [f]: rx }));
    }
    const docs = await applyPopulate(Model.find(filter)).sort(req.query.sort || sort);
    res.json(docs);
  });

  const getOne = asyncHandler(async (req, res) => {
    const doc = await applyPopulate(Model.findById(req.params.id));
    if (!doc) return res.status(404).json({ message: `${Model.modelName} not found` });
    res.json(doc);
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    const populated = await applyPopulate(Model.findById(doc._id));
    res.status(201).json(populated);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await applyPopulate(
      Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    );
    if (!doc) return res.status(404).json({ message: `${Model.modelName} not found` });
    res.json(doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: `${Model.modelName} not found` });
    res.json({ message: `${Model.modelName} deleted`, id: req.params.id });
  });

  return { list, getOne, create, update, remove };
}

module.exports = crudFactory;
