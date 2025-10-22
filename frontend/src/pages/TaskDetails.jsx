import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Loader from "../components/Loader";

export default function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getTask(id);
      setTask(res.data);
      const resC = await api.getComments(id);
      setComments(resC.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    await api.addComment(id, { text: commentText });
    setCommentText("");
    load();
  };

  const upload = async () => {
    if (!file) return alert("Select file");
    const fd = new FormData();
    fd.append("files", file);
    await api.uploadFiles(id, fd);
    setFile(null);
    load();
  };

  if (loading || !task) return <Loader />;

  return (
    <div className="container page">
      <div className="page-head">
        <h2>{task.title}</h2>
        <div className="badges">
          <span className={`badge ${task.priority}`}>{task.priority}</span>
          <span className="badge status">{task.status}</span>
        </div>
      </div>

      <p>{task.description}</p>

      <section className="section">
        <h3>Files</h3>
        <div className="files">
          {task.files && task.files.length ? task.files.map(fId => {
            const f = (task.files && task.files) && null; // metadata loaded at server
            // our server returns files under task.files array of ids; we included files in task response earlier
            return null;
          }) : <div className="muted">No files attached</div>}
        </div>

        <div className="upload-row">
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <button className="btn" onClick={upload}>Upload</button>
        </div>
      </section>

      <section className="section">
        <h3>Comments</h3>
        <div className="comment-form">
          <input placeholder="Write a comment" value={commentText} onChange={e => setCommentText(e.target.value)} />
          <button className="btn" onClick={addComment}>Add</button>
        </div>
        <ul className="comments">
          {comments.length ? comments.map(c => (
            <li key={c.id}>
              <div><strong>{c.author || "User"}</strong> <span className="muted small">{new Date(c.createdAt).toLocaleString()}</span></div>
              <div>{c.text}</div>
            </li>
          )) : <div className="muted">No comments</div>}
        </ul>
      </section>
    </div>
  );
}
