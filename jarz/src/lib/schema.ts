import { Account, Profile, coField, co, z, Group } from "jazz-tools";
export const MessageSchema = co.map({
    text: z.string(),
});
export const MessageFeedSchema = co.feed(MessageSchema)
export const ChannelSchema = co.list(MessageSchema);
export const SpaceSchema = co.list(ChannelSchema)

export const JarzRoot = co.map({
    spaces: co.list(SpaceSchema),
});

const profile = co.map({
    did: z.string(),
    name: z.string(),
    inbox: z.string().optional(),
    inboxInvite: z.string().optional(),
})
export let AccountSchema = co.account({
    root: JarzRoot,
    profile,

});