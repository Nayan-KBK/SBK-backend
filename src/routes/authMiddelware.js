const authenticate = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to the request object
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};
