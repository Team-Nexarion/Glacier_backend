const prisma = require("../../prisma/client");
const BaseRepository = require('./baseRepository');
class LakeReportRepository extends BaseRepository {
    constructor() {
        super(prisma.lakereport);
    }
}
module.exports = LakeReportRepository;
