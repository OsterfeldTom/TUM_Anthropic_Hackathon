-- Delete duplicate applications, keeping only the most recent of each
DELETE FROM applications WHERE id IN (
  '54520e97-cc34-4c90-bd41-1741250a6410',
  '37699258-8a19-45c0-8bb0-55bb1846659a', 
  '67bc77b2-756c-4af6-9224-18cb45f79f3b',
  '870ffdc8-c316-461e-92a7-0cec77a9b348'
);