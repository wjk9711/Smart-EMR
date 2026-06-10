-- 移除 inpatient_patients 表中 id_card 字段的唯一索引
USE emr_system;

-- 检查是否存在 id_card 的唯一索引
SHOW INDEX FROM inpatient_patients WHERE Column_name = 'id_card' AND Non_unique = 0;

-- 移除 id_card 的唯一索引（如果存在）
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS id_card;

-- 验证结果
SHOW INDEX FROM inpatient_patients WHERE Non_unique = 0;

SELECT '✅ id_card 唯一索引已移除' AS result;
