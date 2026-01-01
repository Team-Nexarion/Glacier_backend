const prisma = require("../../prisma/client");
const BaseRepository = require('./baseRepository');
class OfficialRepository extends BaseRepository {
    constructor() {
        super(prisma.official);
    }
}
module.exports = OfficialRepository;