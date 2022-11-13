const config = require('../config.json');
const { dbQuery, escape } = require('./util');

/**
 *
 * @param userId
 * @param foo
 * @return {Promise<boolean>}
 */
exports.toggleMentionable = async (userId, foo) => {
    const query = `INSERT INTO ${config.userTable} (discord_id, mentionable) 
                        VALUES(${escape(userId)}, ${escape(foo)}) 
                   ON DUPLICATE KEY UPDATE mentionable = ${escape(foo)};`
    await dbQuery(query);
    return foo;
}

/**
 *
 * @param bungieName
 * @param userId
 * @return {Promise<string>}
 */
exports.linkAccounts = async (bungieName, userId) => {
    const { findMemberDetails } = await import('../bungie-net-api/profile.mjs');
    const member = await findMemberDetails(bungieName);
    const query = `INSERT INTO ${config.userTable} (discord_id, destiny_membership_id, destiny_membership_type) 
                        VALUES(${escape(userId)}, ${escape(member.membershipId)}, ${escape(member.membershipType)}) 
                   ON DUPLICATE KEY UPDATE destiny_membership_id = ${escape(member.membershipId)}, destiny_membership_type = ${escape(member.membershipType)};`
    await dbQuery(query);
    return member.name;
}

/**
 * Mutates the members dictionary and the pings array
 * @param {{[p:string]: string}} members
 * @param {string[]} pings
 * @return {Promise<void>}
 */
exports.bungieMembersToMentionable = async (members, pings) => {
    return new Promise(async (resolve) => {
        const query = `SELECT destiny_membership_id, discord_id, mentionable
                       FROM ${config.userTable}
                       WHERE destiny_membership_id IN (${escape(Object.keys(members))});`
        await dbQuery(query, resolve);
    }).then(data => {
        data.forEach(rdp => {
            if (rdp.mentionable) pings.push(rdp.discord_id);
            members[rdp.destiny_membership_id].discord = `<@${rdp.discord_id}>`
        })
    });

}