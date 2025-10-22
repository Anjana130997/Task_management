const express=require("express");
const cors=require("cors");
const path=require("path");

const authRoutes=require("./routes/authRoutes");
const taskRoutes=require("./routes/taskRoutes");
const commentRoutes=require("./routes/commentRoutes");
const analyticsRoutes=require("./routes/analyticsRoutes");

const app=express();

app.use(cors());
app.use(express.json());
// set up a static file server for a specific directory,
//  making the files inside it 
// publicly accessible on a particular URL path.
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

app.use("/api/auth",authRoutes);
app.use("/tasks",taskRoutes);
app.use("/api/comments",commentRoutes);
app.use("api/analytics",analyticsRoutes);

const PORT=4000;
app.listen(PORT,()=>console.log(`Server is listening on port ${PORT}`));
