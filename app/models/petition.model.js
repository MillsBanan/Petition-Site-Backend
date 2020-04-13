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
    const [result] = await conn.query('SELECT * FROM Petition WHERE petition_id = ?', [petitionId]);
    console.log(result);
    conn.release();
    return result;
}