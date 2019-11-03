import { User } from '../../user/interfaces/user.interface';
import { Types } from 'mongoose';
import { SocialUserRole } from '../../user/enums/social-user-role.enum';

/**
 * Get User's role in the group. return `null` if user was not in the group.
 */
export function getUserRole(
  user: User,
  socialId: Types.ObjectId,
): SocialUserRole {
  let role: SocialUserRole;
  user.socials.some(rs => {
    if (rs.social === socialId) {
      role = rs.role;
      return true;
    } else {
      return false;
    }
  });
  return role;
}

/**
 * Allow this conditions:
 * 1. user is author
 * 2. userRole is creator
 * 3. userRole is moderator and author is user
 */
export function hasPermissionToAction(
  user: User,
  author: User,
  groupId: Types.ObjectId,
): boolean {
  if (user.id === author.id) {
    return true;
  } else {
    const userRole = getUserRole(user, groupId);
    if (userRole === SocialUserRole.CREATOR) {
      return true;
    } else {
      const authorRole = getUserRole(author, groupId);
      if (
        userRole === SocialUserRole.MODERATOR &&
        authorRole === SocialUserRole.MEMBER
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
}
