-- Query 1

USE public.account;

INSERT INTO account
	(account_firstname, account_lastname, account_email, account_password)
VALUES 
	('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Query 2
UPDATE account 
SET account_type = 'Admin'
WHERE account_id = 1;

-- Query 3
DELETE FROM account
WHERE account_id = 1;



-- Query 4
USE public.inventory;

SELECT REPLACE(inv_description, 'small interiors', 'a hugh interior')
FROM inventory
WHERE inv_id = 10;


-- Query 5
USE public.classification;

SELECT classification_name, inv_make, inv_model
FROM classification cn 
	JOIN inventory inv
	ON cn.classification_id = inv.classification_id
WHERE classification_name = 'Sport';

-- Query 6
UPDATE inventory
SET inv_image ='/images/vehicles/' || SUBSTRING(inv_image from '/images/(.*)'),
	inv_thumbnail = '/images/vehicles/' || SUBSTRING(inv_thumbnail from '/images/(.*)')
WHERE inv_image LIKE '/images/%' OR inv_thumbnail LIKE '/images/%'; 



