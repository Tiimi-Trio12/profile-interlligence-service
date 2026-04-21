const { prisma } = require('../config/prisma');

// Find profile by name (used for idempotency check)
async function findByName(name) {
  return prisma.profile.findUnique({
    where: { name }
  });
}

// Create new profile record
async function createProfile(data) {
  return prisma.profile.create({
    data
  });
}

// Find by ID
async function findById(id) {
  return prisma.profile.findUnique({
    where: { id }
  });
}

// Get all with filters
async function findAll(options) {
  return prisma.profile.findMany({
    where: options?.where,
    orderBy: options?.orderBy,
    skip: options?.skip,
    take: options?.take
  });
}

async function count(filters) {
  return prisma.profile.count({
    where: filters
  });
}

// Delete profile
async function deleteById(id) {
  return prisma.profile.delete({
    where: { id }
  });
}

module.exports = {
  findByName,
  createProfile,
  findById,
  findAll,
  count,
  deleteById
};