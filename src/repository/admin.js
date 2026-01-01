const prisma = require("../../prisma/client");
const BaseRepository= require('./baseRepository');
class AdminRepository extends BaseRepository {
    constructor(){
        super(prisma.admin);
    }
}
module.exports = AdminRepository;