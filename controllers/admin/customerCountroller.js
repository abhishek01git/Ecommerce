const User = require('../../models/userSchema');

const customerInfo = async (req, res) => {
  try {
    let search = req.query.search || "";  // Default to an empty string if no search query
    let page = parseInt(req.query.page) || 1;  // Default to page 1 if no page query is provided
    const limit = 3;  // Number of customers per page

    // Search query with case-insensitive matching for name and email
    const regexSearch = new RegExp(search, 'i');
    
    // Fetch user data based on search query, and apply pagination
    const userData = await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: regexSearch } },
        { email: { $regex: regexSearch } },
        { phone: { $regex: regexSearch } }
      ]
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Get the total number of users that match the search query
    const count = await User.countDocuments({
      isAdmin: false,
      $or: [
        { name: { $regex: regexSearch } },
        { email: { $regex: regexSearch } }
      ]
    });

    // Calculate total pages for pagination
    const totalPages = Math.ceil(count / limit);

    // Pass data to the view
    res.render("customer", {
      data: userData,
      currentPage: page,
      totalPages: totalPages,
      search: search  // Pass the search term to retain it in the form
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching customer data");
  }
};

const customerBlocked = async (req, res) => {
  try {
    let id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect('/admin/users'); // Corrected redirect
  } catch (error) {
    res.redirect('pageError'); // Corrected redirect
  }
};

const customerunBlocked = async (req, res) => {
  try {
    let id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect('/admin/users'); // Corrected redirect
  } catch (error) {
    res.redirect('pageError'); // Corrected redirect
  }
};

module.exports = {
  customerInfo,
  customerBlocked,
  customerunBlocked // Corrected export
};
