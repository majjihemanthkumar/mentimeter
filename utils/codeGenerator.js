// utils/codeGenerator.js
// Generates unique 6-digit room codes

function generateCode(existingCodes = new Set()) {
    let code;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (existingCodes.has(code));
    return code;
}

module.exports = { generateCode };
