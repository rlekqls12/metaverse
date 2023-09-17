/** @type { MetaverseData } */
export const metaverseData = {
  users: [],
  chats: {},
};

// ---------------------------------------------------------------------- [ TYPE ]
/**
 * @typedef MetaverseData
 * @property { MetaverseUser[] } users
 * @property { MetaverseChatGroup } chats
 */

/**
 * @typedef MetaverseUser
 * @property { string } ip
 * @property { string } id
 * @property { string } map
 * @property { number[] } position
 * @property { number } speed
 * @property { number } lastConnection
 */

/**
 * @typedef { Object.<string, MetaverseChat[]> } MetaverseChatGroup
 */

/**
 * @typedef MetaverseChat
 * @property { string } ip
 * @property { string } id
 * @property { string } content
 * @property { number } date
 */
