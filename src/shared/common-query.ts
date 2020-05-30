export const POST_JOIN_SOCIAL = [
    { $lookup: { from: 'socials', localField: 'social', foreignField: '_id', as: 'social' } },
    { $unwind: '$social' },
    { $addFields: { social: '$social.name', type: '$social.type', sid: '$social._id' } }];

export const POST_JOIN_AUTHOR = [
    { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
    { $unwind: '$author' },
    { $addFields: { author: '$author.username' } },
];
