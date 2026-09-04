import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { authedMutation, authedQuery } from "./lib/customFunctions";
import { noteValidator } from "./lib/validators";

const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 8000;

function requireOwnedNote(
  note: Doc<"notes"> | null,
  userId: Id<"users">,
): Doc<"notes"> {
  if (!note) {
    throw new Error("Note not found");
  }
  if (note.userId !== userId) {
    throw new Error("You can only access your own notes");
  }
  return note;
}

function validateNoteFields(title: string, body: string): {
  title: string;
  body: string;
} {
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();

  if (trimmedTitle.length < 1) {
    throw new Error("Title is required");
  }
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
  }
  if (trimmedBody.length < 1) {
    throw new Error("Note body is required");
  }
  if (trimmedBody.length > MAX_BODY_LENGTH) {
    throw new Error(`Note body must be less than ${MAX_BODY_LENGTH} characters`);
  }

  return { title: trimmedTitle, body: trimmedBody };
}

async function getOwnedNote(
  ctx: MutationCtx,
  noteId: Id<"notes">,
  userId: Id<"users">,
): Promise<Doc<"notes">> {
  const note = await ctx.db.get("notes", noteId);
  return requireOwnedNote(note, userId);
}

export const listMine = authedQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(noteValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("notes")
      .withIndex("by_user_and_created", (q) => q.eq("userId", ctx.user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      page: results.page.map((note) => ({
        _id: note._id,
        userId: note.userId,
        title: note.title,
        body: note.body,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

export const create = authedMutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const fields = validateNoteFields(args.title, args.body);
    return await ctx.db.insert("notes", {
      userId: ctx.user._id,
      title: fields.title,
      body: fields.body,
      createdAt: Date.now(),
    });
  },
});

export const update = authedMutation({
  args: {
    noteId: v.id("notes"),
    title: v.string(),
    body: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await getOwnedNote(ctx, args.noteId, ctx.user._id);
    const fields = validateNoteFields(args.title, args.body);
    await ctx.db.patch("notes", args.noteId, {
      title: fields.title,
      body: fields.body,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = authedMutation({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await getOwnedNote(ctx, args.noteId, ctx.user._id);
    await ctx.db.delete("notes", args.noteId);
    return null;
  },
});
