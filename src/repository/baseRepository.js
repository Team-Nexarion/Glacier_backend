class BaseRepository {
  constructor(model) {
    this.model = model;
   
  }

  create(data) {
    return this.model.create({ data });
  }

  createMany(data) {
    return this.model.createMany({ data });
  }

  findUnique(where) {
    return this.model.findUnique({ where });
  }

  findMany(args = {}) {
    return this.model.findMany(args);
  }


  update(where, data) {
    return this.model.update({ where, data });
  }

  updateMany(where, data) {
    return this.model.updateMany({ where, data });
  }

  delete(where) {
    return this.model.delete({ where });
  }

  deleteMany(where) {
    return this.model.deleteMany({ where });
  }
  count(where = {}) {
    return this.model.count({ where });
  }
}
module.exports=BaseRepository