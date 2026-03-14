const router = require('express').Router();
const Poll   = require('../models/Poll');
const auth   = require('../middleware/auth');

// GET all polls
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
    if (search) query.question = { $regex: search, $options: 'i' };
    const polls = await Poll.find(query).populate('creator', 'username').sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET single poll
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('creator', 'username');
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });
    res.json(poll);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET my polls
router.get('/user/my', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.user.id }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// CREATE poll
router.post('/', auth, async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;
    if (!question || !options || options.length < 2)
      return res.status(400).json({ msg: 'Need a question and at least 2 options' });

    const poll = await Poll.create({
      question,
      options: options.map(text => ({ text })),
      creator: req.user.id,
      expiresAt: expiresAt || null,
    });
    const populated = await poll.populate('creator', 'username');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// VOTE
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });
    if (poll.expiresAt && poll.expiresAt < new Date())
      return res.status(400).json({ msg: 'Poll has expired' });
    if (poll.voters.map(String).includes(String(req.user.id)))
      return res.status(400).json({ msg: 'You already voted' });

    const { optionIndex } = req.body;
    poll.options[optionIndex].votes += 1;
    poll.voters.push(req.user.id);
    await poll.save();

    const populated = await poll.populate('creator', 'username');
    req.app.get('io').emit(`poll:${poll._id}`, populated); // real-time emit
    res.json(populated);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// DELETE poll
router.delete('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });
    if (String(poll.creator) !== String(req.user.id))
      return res.status(403).json({ msg: 'Not authorized' });
    await poll.deleteOne();
    res.json({ msg: 'Poll deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
