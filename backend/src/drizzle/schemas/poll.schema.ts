import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  index,
  unique
} from "drizzle-orm/pg-core";
import { user } from "./user.schema";

export const pollStatusEnum = pgEnum("poll_status", [
  "draft",
  "active",
  "closed",
  "published"
]);

export const poll = pgTable(
  "poll",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    expiresAt: timestamp("expires_at"),
    responseGoal: integer("response_goal"),
    status: pollStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at")
  },
  table => [
    index("poll_creator_id_idx").on(table.creatorId),
    index("poll_status_idx").on(table.status)
  ]
);

export const question = pgTable(
  "question",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id")
      .notNull()
      .references(() => poll.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isMandatory: boolean("is_mandatory").default(true).notNull(),
    orderIndex: integer("order_index").notNull()
  },
  table => [index("question_poll_id_idx").on(table.pollId)]
);

export const option = pgTable(
  "option",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    orderIndex: integer("order_index").notNull()
  },
  table => [index("option_question_id_idx").on(table.questionId)]
);

export const response = pgTable(
  "response",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id")
      .notNull()
      .references(() => poll.id, { onDelete: "cascade" }),
    respondentId: text("respondent_id").references(() => user.id, {
      onDelete: "set null"
    }),
    sessionToken: text("session_token"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull()
  },
  table => [
    index("response_poll_id_idx").on(table.pollId),
    unique("response_poll_respondent_unique")
      .on(table.pollId, table.respondentId)
      .nullsNotDistinct(),
    unique("response_poll_session_unique")
      .on(table.pollId, table.sessionToken)
      .nullsNotDistinct()
  ]
);

export const responseAnswer = pgTable(
  "response_answer",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => response.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    optionId: uuid("option_id")
      .notNull()
      .references(() => option.id, { onDelete: "cascade" })
  },
  table => [index("response_answer_response_id_idx").on(table.responseId)]
);

export const pollRelations = relations(poll, ({ one, many }) => ({
  creator: one(user, { fields: [poll.creatorId], references: [user.id] }),
  questions: many(question),
  responses: many(response)
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  poll: one(poll, { fields: [question.pollId], references: [poll.id] }),
  options: many(option)
}));

export const optionRelations = relations(option, ({ one }) => ({
  question: one(question, {
    fields: [option.questionId],
    references: [question.id]
  })
}));

export const responseRelations = relations(response, ({ one, many }) => ({
  poll: one(poll, { fields: [response.pollId], references: [poll.id] }),
  respondent: one(user, {
    fields: [response.respondentId],
    references: [user.id]
  }),
  answers: many(responseAnswer)
}));

export const responseAnswerRelations = relations(responseAnswer, ({ one }) => ({
  response: one(response, {
    fields: [responseAnswer.responseId],
    references: [response.id]
  }),
  question: one(question, {
    fields: [responseAnswer.questionId],
    references: [question.id]
  }),
  option: one(option, {
    fields: [responseAnswer.optionId],
    references: [option.id]
  })
}));
