const prisma = require("../../prisma/client");
const {baseRepository} = require('./baseRepository');
class officialRepository extends baseRepository {
    constructor() {
        super(prisma.Official);
    }
}
module.exports = {officialRepository};