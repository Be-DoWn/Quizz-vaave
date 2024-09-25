import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function Questions() {
  const [user, setUser] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]); // Store user's selected answers
  const navigate = useNavigate();
  const { topic_name, id } = useParams();
  console.log(id);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    // check session
    axios
      .get("http://localhost:8080/session")
      .then((res) => {
        if (res.data.loggedIn) {
          setUser(res.data.user.email);
          fetchQuestions(topic_name);
        } else {
          navigate("/home");
        }
      })
      .catch((err) => {
        console.log(err);
        navigate("/home");
      });
  }, [navigate, topic_name]);

  const fetchQuestions = (topic) => {
    // Correct the axios get request by passing topic in params
    axios
      .get("http://localhost:8080/questions", { params: { topic } })
      .then((res) => {
        console.log(res.data);
        const formattedData = structureQuestions(res.data);
        setQuestions(formattedData);
        console.log(questions);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const structureQuestions = (data) => {
    const formattedData = [];
    data.forEach((item) => {
      const existingQuestion = formattedData.find(
        (q) => q.question_text === item.question_text
      );
      if (!existingQuestion) {
        formattedData.push({
          question_text: item.question_text,
          level_id: item.level_id,
          question_id: item.question_id,
          options: [
            {
              option_text: item.option_text,
              is_correct: item.is_correct,
              option_id: item.option_id,
            },
          ],
        });
      } else {
        existingQuestion.options.push({
          option_text: item.option_text,
          is_correct: item.is_correct,
          option_id: item.option_id,
        });
      }
    });
    return formattedData;
  };

  const checkAnswer = (selectedOption, option_id, question_id, level_id) => {
    const currentQ = questions[currentQuestion];
    const correctOption = currentQ.options.find((opt) => opt.is_correct);
    console.log(correctOption, currentQ.options);
    //saving user responses
    const updatedAnswers = [
      ...userAnswers,
      {
        level_id: level_id,
        question_id: question_id,
        selected_option_id: option_id,
        is_correct: selectedOption === correctOption.option_text, //true or false
      },
    ];
    setUserAnswers(updatedAnswers); // Update user answers state

    if (selectedOption === correctOption.option_text) {
      setScore(score + 1); // add+1 to score if the answer is correct
    }

    if (currentQuestion < questions.length - 1) {
      // move to the next question if not the last question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // if it's the last question, mark the quiz as completed
      setQuizCompleted(true);
      const userData = {
        user: user,
        score: score + (selectedOption === correctOption.option_text ? 1 : 0), //missing last question response so adding once again
        responses: updatedAnswers, 
      };
      // console.log(userData);
      submittingScore(userData); // passing user data to submit function
    }
  };

  const submittingScore = (userData) => {
    axios
      .post("http://localhost:8080/userdata", {
        ...userData,
        topic_id: id, // need topic_id also to to store in the userResponses
      })
      .then((res) => {
        console.log("Response from backend: ", res.data);
      })
      .catch((err) => {
        console.log("Error sending data to backend: ", err);
      });
  };

  return (
    <div>
      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <div>
          {!quizCompleted ? (
            <div>
              <h2>Questions for {topic_name}</h2>
              <div>
                <h3>
                  {currentQuestion + 1}.{" "}
                  {questions[currentQuestion].question_text}
                </h3>
                {questions[currentQuestion].options.map((opt, index) => {
                  return (
                    <button
                      key={index}
                      onClick={() =>
                        checkAnswer(
                          opt.option_text,
                          opt.option_id,
                          questions[currentQuestion].question_id,
                          questions[currentQuestion].level_id
                        )
                      }
                    >
                      {opt.option_text}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p>Score: {score}</p>
              <button
                onClick={() => {
                  navigate("/topics");
                }}
              >
                Go to topics
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
