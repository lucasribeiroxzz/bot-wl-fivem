const pendingReviews = new Map();

function setPendingReview(accountId, data) {
  pendingReviews.set(String(accountId), data);
}

function getPendingReview(accountId) {
  return pendingReviews.get(String(accountId));
}

function removePendingReview(accountId) {
  pendingReviews.delete(String(accountId));
}

module.exports = { setPendingReview, getPendingReview, removePendingReview };
