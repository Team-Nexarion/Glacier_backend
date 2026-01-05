/*
  Warnings:

  - You are about to drop the column `glacial_lake_volume_change` on the `lakereport` table. All the data in the column will be lost.
  - You are about to drop the column `glacier_mass_balance` on the `lakereport` table. All the data in the column will be lost.
  - You are about to drop the column `glacier_retreat_rate` on the `lakereport` table. All the data in the column will be lost.
  - You are about to drop the column `moraine_dam_stability` on the `lakereport` table. All the data in the column will be lost.
  - You are about to drop the column `temperature_trend` on the `lakereport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `lakereport` DROP COLUMN `glacial_lake_volume_change`,
    DROP COLUMN `glacier_mass_balance`,
    DROP COLUMN `glacier_retreat_rate`,
    DROP COLUMN `moraine_dam_stability`,
    DROP COLUMN `temperature_trend`,
    ADD COLUMN `Dam_Slope_deg` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `Elevation_m` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `Lake_Area_km2` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `Lake_Temp_C` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `declineById` INTEGER NULL,
    ADD COLUMN `declinedAt` DATETIME(3) NULL,
    MODIFY `riskLevel` ENUM('LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE') NOT NULL DEFAULT 'LOW',
    MODIFY `verificationStatus` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `lakereport` ADD CONSTRAINT `lakereport_declineById_fkey` FOREIGN KEY (`declineById`) REFERENCES `official`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
