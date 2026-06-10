USE emr_system;

-- 检查是否有重复的分配记录
SELECT 
    pa.patient_id,
    pa.user_id,
    pa.copied_patient_id,
    COUNT(*) as assign_count
FROM patient_assignments pa
GROUP BY pa.patient_id, pa.user_id
HAVING assign_count > 1;

-- 检查某个患者的病案数量
SELECT 
    ip.name as patient_name,
    ip.inpatient_no,
    ip.doctor_id,
    COUNT(ir.id) as record_count
FROM inpatient_patients ip
LEFT JOIN inpatient_records ir ON ip.id = ir.patient_id
WHERE ip.name = 'ff'  -- 替换为实际患者姓名
GROUP BY ip.id, ip.name, ip.inpatient_no, ip.doctor_id
ORDER BY ip.id;
