const errorHandler = (err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
};

export default errorHandler;
