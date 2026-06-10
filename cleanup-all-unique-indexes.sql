-- 清理 inpatient_patients 表中所有不必要的唯一索引
USE emr_system;

-- 移除所有 id_card 相关的唯一索引
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS id_card;
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS id_card_2;
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS id_card_3;
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS id_card_4;
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS id_card_5;

-- 移除多余的 unique_key 索引（只保留一个）
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS unique_key_2;
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS unique_key_3;
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS unique_key_4;
ALTER TABLE inpatient_patients DROP INDEX IF EXISTS unique_key_5;

-- 验证结果：应该只剩下 PRIMARY 和一个 unique_key
SHOW INDEX FROM inpatient_patients WHERE Non_unique = 0;

SELECT '✅ 所有不必要的唯一索引已移除' AS result;
