const db = require('../../config/db');

exports.getAll = async function(queryParams) {

    console.log('Request to get all petitions from the database...');

    const conn = await db.getPool().getConnection();

    let query = 'SELECT ' +
                'p.petition_id as petitionId, p.title as title, ' +
                'c.name as category, u.name as authorName, count(*) as signatureCount ' +
                'FROM Petition p ' +
                    'LEFT JOIN User u ' +
                        'ON p.author_id = u.user_id ' +
                    'LEFT JOIN Category c ' +
                        'ON p.category_id = c.category_id ' +
                    'LEFT JOIN Signature s ' +
                        'ON p.petition_id = s.petition_id ' +
                'WHERE 1=1';

    if (queryParams.q !== undefined) {
        query += ` AND title LIKE ${conn.escape(`%${queryParams.q}%`)}`;
    }
    if (queryParams.categoryId !== undefined) {
        query += ` AND p.category_id = ${conn.escape(queryParams.categoryId)}`;
    }
    if (queryParams.authorId !== undefined) {
        query += ` AND p.author_id = ${conn.escape(queryParams.authorId)}`;
    }

    query += ' GROUP BY p.petition_id';

               switch (queryParams.sortBy) {
                case "SIGNATURES_DESC":
                    query += ' ORDER BY count(*) DESC';
                    break;

                case "SIGNATURES_ASC":
                    query += ' ORDER BY count(*) ASC';
                    break;

                case "ALPHABETICAL_DESC":
                    query += ' ORDER BY title DESC';
                    break;

                case "ALPHABETICAL_ASC":
                    query += ' ORDER BY title ASC';
                    break;

        default:
            query += ' ORDER BY count(*) DESC';
            break;
    }

    const [result] = await conn.query(query);
    conn.release();
    return result;
};

exports.insert = async function (petitionData) {

    console.log("Request to insert a petition into the database...");
    const conn = await db.getPool().getConnection();
    const inserts = [petitionData.title,
                     petitionData.description,
                     petitionData.authorId,
                     petitionData.categoryId,
                     new Date().toISOString().slice(0, 19).replace('T', ' '),
                     petitionData.closingDate];
    await conn.query('INSERT INTO Petition (title , description, author_id, category_id, created_date, closing_date) ' +
        'VALUES (?)', [inserts]);
    const result = await conn.query(`SELECT petition_id FROM Petition WHERE title = ?`, [petitionData.title]);
    conn.release();
    return result[0];
};

exports.categoryInvalid = async function (categoryId) {

    console.log("Checking if categoryId is in DB...");

    const conn = await db.getPool().getConnection();
    const [result] = await conn.query(`SELECT name FROM Category WHERE category_id = ?`, [categoryId]);
    conn.release();
    return result.length === 0;

};

exports.getOne = async function (petitionId) {
    console.log("Request to get one petitions info... ");
    const conn = await db.getPool().getConnection();
    const sql = 'SELECT ' +
                'p.petition_id as petitionId, p.title as title, c.name as category, u.name as authorName,' +
                'count(*) as signatureCount, p.description as description, p.author_id as authorId, ' +
                'u.city as authorCity, u.country as authorCountry, p.created_date as createdDate, ' +
                'p.closing_date as closingDate ' +
                'FROM Petition p ' +
                    'LEFT JOIN User u ' +
                        'ON p.author_id = u.user_id ' +
                    'LEFT JOIN Category c ' +
                        'ON p.category_id = c.category_id ' +
                    'LEFT JOIN Signature s ' +
                        'ON p.petition_id = s.petition_id ' +
                'WHERE p.petition_id = ?';
    const [result] = await conn.query(sql, [petitionId]);
    conn.release();
    return result;
};

exports.userIsAuthor = async function (userId, petitionId) {
    console.log("Checking if user is author of petition");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT author_id FROM Petition WHERE petition_id = ?', [petitionId]);
    conn.release();
    return result[0]["author_id"] === parseInt(userId);
};

exports.petitionNotExists = async function (petitionId) {
    console.log("Checking if petition exists...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT title FROM Petition WHERE petition_id = ?', [petitionId]);
    conn.release();
    return result.length === 0;
};

exports.update = async function (petitionData, petitionId) {
    console.log("Request to update a petition...");

    const conn = await db.getPool().getConnection();
    if (petitionData.categoryId !== undefined) {
        petitionData["category_id"] = petitionData.categoryId;
        delete petitionData.categoryId;
    }
    if (petitionData.closingDate !== undefined) {
        petitionData["closing_date"] = petitionData.closingDate;
        delete petitionData.closingDate;
    }
    const [result] = await conn.query('UPDATE Petition SET ? WHERE petition_id = ?', [petitionData, petitionId]);
    conn.release();
    return result;
};

exports.delete = async function (petitionId) {
    console.log("Deleting petition and all of it's signatures...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('DELETE p, s FROM Petition p LEFT JOIN Signature s ' +
                                      'ON p.petition_id = s.petition_id WHERE p.petition_id = ?', [petitionId]);
    conn.release();
    return result;
};

exports.getCategories = async function () {
    console.log("Retrieving all categories from database...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT category_id as categoryId, name FROM Category');
    conn.release();
    return result;
};

exports.petitionClosed = async function (petitionId) {
    console.log("Checking if petition has closed...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT closing_date FROM Petition WHERE petition_id = ?', [petitionId]);
    conn.release();
    if (result[0]["closing_date"] === null) {
        return false;
    } else {
        return result[0]["closing_date"] < Date.now();
    }
};
