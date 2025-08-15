import { gql } from '@apollo/client';

export const typeDefs = gql`
  type User {
    id: ID!
    auth0Id: String!
    email: String!
    name: String
    role: Role!
    organizationId: String
    organization: Organization
    shifts: [Shift!]!
    createdAt: String!
    updatedAt: String!
  }

  type Organization {
    id: ID!
    name: String!
    locationLat: Float!
    locationLng: Float!
    perimeterRadius: Int!
    users: [User!]!
    shifts: [Shift!]!
    createdAt: String!
    updatedAt: String!
  }

  type Shift {
    id: ID!
    userId: String!
    user: User!
    organizationId: String!
    organization: Organization!
    clockInTime: String!
    clockInLat: Float!
    clockInLng: Float!
    clockInNote: String
    clockOutTime: String
    clockOutLat: Float
    clockOutLng: Float
    clockOutNote: String
    duration: Int
    createdAt: String!
    updatedAt: String!
  }

  type ShiftAnalytics {
    avgHoursPerDay: Float!
    totalUsersToday: Int!
    totalHoursThisWeek: Float!
    activeShifts: Int!
  }

  type UserShiftSummary {
    user: User!
    totalHoursThisWeek: Float!
    shiftsThisWeek: Int!
  }

  enum Role {
    MANAGER
    CARE_WORKER
  }

  input LocationInput {
    lat: Float!
    lng: Float!
  }

  input ClockInInput {
    location: LocationInput!
    note: String
  }

  input ClockOutInput {
    location: LocationInput!
    note: String
  }

  input CreateOrganizationInput {
    name: String!
    location: LocationInput!
    perimeterRadius: Int!
  }

  type Query {
    me: User
    organization: Organization
    shifts(userId: String): [Shift!]!
    activeShifts: [Shift!]!
    shiftAnalytics: ShiftAnalytics!
    userShiftSummaries: [UserShiftSummary!]!
    canClockIn(location: LocationInput!): Boolean!
    currentShift: Shift
  }

  type Mutation {
    createUser(name: String!, role: Role!): User!
    updateUserRole(userId: ID!, role: Role!): User!
    createOrganization(input: CreateOrganizationInput!): Organization!
    clockIn(input: ClockInInput!): Shift!
    clockOut(input: ClockOutInput!): Shift!
  }
`;