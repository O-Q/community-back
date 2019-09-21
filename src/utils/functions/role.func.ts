import { User } from '../../user/interfaces/user.interface';
import { Types } from 'mongoose';
import { GroupUserRole } from '../../user/enums/group-user-role.enum';

/**
 * Get User's role in the group. return `null` if user was not in the group.
 */
export function getUserRole(
  user: User,
  groupId: Types.ObjectId,
): GroupUserRole {
  let role: GroupUserRole;
  user.groups.some(rg => {
    if (rg.group === groupId) {
      role = rg.role;
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
    if (userRole === GroupUserRole.CREATOR) {
      return true;
    } else {
      const authorRole = getUserRole(author, groupId);
      if (
        userRole === GroupUserRole.MODERATOR &&
        authorRole === GroupUserRole.MEMBER
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
}
