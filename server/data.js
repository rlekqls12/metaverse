/** @type { MetaverseData } */
export const metaverseData = {
  users: [],
  chats: [],
};

// ---------------------------------------------------------------------- [ TYPE ]
/**
 * @typedef MetaverseData
 * @property { MetaverseUser[] } users
 * @property { MetaverseChat[] } chats
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
 * @typedef MetaverseChat
 * @property { string } ip
 * @property { string } id
 * @property { string } content
 * @property { number } date
 */
