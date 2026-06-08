-- 为 patients 表添加 doctor_id 字段
ALTER TABLE `patients` 
ADD COLUMN `doctor_id` INT UNSIGNED NULL COMMENT '创建该患者的医生ID',
ADD INDEX `idx_doctor_id` (`doctor_id`),
ADD CONSTRAINT `fk_patients_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 为 inpatient_patients 表添加 doctor_id 字段
ALTER TABLE `inpatient_patients` 
ADD COLUMN `doctor_id` INT UNSIGNED NULL COMMENT '创建该患者的医生ID',
ADD INDEX `idx_doctor_id` (`doctor_id`),
ADD CONSTRAINT `fk_inpatient_patients_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 验证字段是否添加成功
SHOW COLUMNS FROM `patients` LIKE 'doctor_id';
SHOW COLUMNS FROM `inpatient_patients` LIKE 'doctor_id';
