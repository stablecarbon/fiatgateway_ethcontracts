// Print pretty test title
module.exports = async function (user, desc) {
    return '\x1b[33m' + user + '\u001b[00m: \u001b[01;34m' + desc;
}