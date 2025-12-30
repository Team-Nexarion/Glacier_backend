const prisma = require("../../prisma/client");
const {baseRepository} = require('./baseRepository');
class lakeReportRepository extends baseRepository {
    constructor() {
        super(prisma.LakeReport);
    }
}
module.exports = {lakeReportRepository};