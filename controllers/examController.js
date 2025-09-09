import pool from "../config/db.js";

export const examPortal = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");
  try {
    const results = await pool.query(
      "SELECT * FROM exam_results WHERE aadhar=$1 ORDER BY timestamp DESC",
      [req.session.aadhar]
    );
    res.render("exam-portal", { results: results.rows });
  } catch (err) {
    console.error(err);
    res.render("exam-portal", { results: [] });
  }
};

export const startExam = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");
  const { lang } = req.query;
  const valid = ["java", "cpp", "python"];
  if (!valid.includes(lang)) return res.redirect("/exam-portal");

  try {
    const questions = await pool.query(
      "SELECT * FROM exam_questions WHERE language=$1 ORDER BY RANDOM() LIMIT 10",
      [lang]
    );
    res.render("exam", { examLanguage: lang, questions: questions.rows });
  } catch (err) {
    console.error(err);
    res.redirect("/exam-portal");
  }
};

export const submitExam = async (req, res) => {
  try {
    const aadhar = req.session?.aadhar;
    if (!aadhar) return res.status(400).send("Session expired");

    const { questionIds, language } = req.body;
    const qIds = questionIds.split(",").map(id => parseInt(id));
    let score = 0, questions = [], userAnswers = [];

    for (const qId of qIds) {
      const ans = parseInt(req.body[`q${qId}`]) || null;
      userAnswers.push(ans);
      const qRes = await pool.query(
        "SELECT * FROM exam_questions WHERE id=$1 AND language=$2",
        [qId, language]
      );
      if (qRes.rows.length === 0) continue;
      const question = qRes.rows[0];
      questions.push(question);
      if (ans !== null && ans === question.correct_answer) score++;
    }

    const percentage = Math.round((score / qIds.length) * 100);
    const timestamp = new Date();
    await pool.query(
      `INSERT INTO exam_results (aadhar,language,score,total_questions,percentage,timestamp)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [aadhar, language, score, qIds.length, percentage, timestamp]
    );

    res.render("results", {
      result: { language, score, total_questions: qIds.length, percentage, timestamp },
      questions,
      userAnswers
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting exam");
  }
};

export const viewResult = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");
  try {
    const result = await pool.query(
      "SELECT * FROM exam_results WHERE id=$1 AND aadhar=$2",
      [req.params.id, req.session.aadhar]
    );
    if (result.rows.length === 0) return res.redirect("/exam-portal");

    const questions = await pool.query(
      "SELECT * FROM exam_questions WHERE language=$1",
      [result.rows[0].language]
    );

    res.render("results", {
      result: result.rows[0],
      questions: questions.rows,
      userAnswers: Array(questions.rows.length).fill(0),
      percentage: result.rows[0].percentage
    });
  } catch (err) {
    console.error(err);
    res.redirect("/exam-portal");
  }
};
