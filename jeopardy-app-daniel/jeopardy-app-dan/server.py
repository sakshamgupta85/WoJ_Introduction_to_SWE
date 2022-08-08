import os
import uuid
import math
import argparse
from pathlib import Path
from typing import List, Tuple, Dict
from datetime import datetime
import random

import uvicorn
import numpy as np
import pandas as pd
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from fastapi import FastAPI
from pydantic import BaseModel

PORT = int(os.environ.get("PORT", "8666"))
OUTPUT_DIR = Path("outputs/")
APP = FastAPI()
ORIGINS = [
    "*"
]
APP.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
APP.add_middleware(
    SessionMiddleware,
    secret_key="asdjlksd281"
)

# this will map game IDs to JeopardyGames
GLOBAL_CACHE: Dict = {}
CATEGORIES = ["CATEGORY A", "CATEGORY B", "CATEGORY C", \
    "CATEGORY D", "CATEGORY E", "CATEGORY F", "CATEGORY G", "CATEGORY H"]
stub_qs = ["Please select 'A'"] * 5
stub_as = ["A"] * 5
CATEGORIES_TO_QUESTIONS = {cat:list(zip(stub_qs, stub_as)) for cat in CATEGORIES}
# this function just creates a new jeopardy board from scratch
# input 'round' is an int, indicating if this is the first round
# or second, where point values are doubled
def make_new_board(round):
    # we need 6 cateogries, with 5 questions each
    random.shuffle(CATEGORIES)
    to_draw = CATEGORIES[0:6]
    questions = dict()
    for cat in to_draw:
        qs = CATEGORIES_TO_QUESTIONS[cat]
        print("~~~~~~~~~~: ", qs)
        to_map = []
        if round == 1:
            update = 100
        else:
            update = 200
        curr_points = update
        for q_a in qs:
            print("pls be a tuple: ", q_a)
            q = q_a[0]
            a = q_a[1]
            to_app = JeopardyQuestion(q,a,curr_points)
            to_map.append(to_app)
            curr_points += update
        questions[cat] = to_map
    print(questions)
    print(to_draw)
    return JeopardyBoard(questions, to_draw)



def get_board_html(board):
    board_cats = board.categories
    board_qs = board.questions
    to_return = "<table><tbody><tr>"
    for cat in board_cats:
        to_return += "<th>"
        to_return += cat
        to_return += "</th>"
    to_return += "</tr>"
    for row in range(5):
        to_return += "<tr>"
        for cat in board_cats:
            to_return += "<td><p>"
            curr_q = board_qs[cat][row]
            if curr_q.answered:
                to_return += "-"
            else:
                to_return += str(curr_q.value)
            to_return += "</p></td>"
        to_return += "</tr>"
    to_return += "</tbody>"
    to_return += "</table>"
    return to_return
    # return "<table><tbody><tr>\
    #               <th>Category 1</th>\
    #               <th>Category 2</th>\
    #               <th>Category 3</th>\
    #               <th>Category 4</th>\
    #               <th>Category 5</th>\
    #               <th>Category 6</th>\
    #             </tr>\
    #             <tr>\
    #               <td><p>100</p></td>\
    #               <td><p id=\"row1col2\">100</p></td>\
    #               <td><p id=\"row1col3\">100</p></td>\
    #               <td><p id=\"row1col4\">100</p></td>\
    #               <td><p id=\"row1col5\">100</p></td>\
    #               <td><p id=\"row1col6\">100</p></td>\
    #             </tr>\
    #             <tr>\
    #               <td><p id=\"row2col1\">200</p></td>\
    #               <td><p id=\"row2col2\">200</p></td>\
    #               <td><p id='row2col3'>200</p></td>\
    #               <td><p id='row2col4'>200</p></td>\
    #               <td><p id='row2col5'>200</p></td>\
    #               <td><p id='row2col6'>200</p></td>\
    #             </tr>\
    #             <tr>\
    #               <td><p id='row3col1'>300</p></td>\
    #               <td><p id='row3col2'>300</p></td>\
    #               <td><p id='row3col3'>300</p></td>\
    #               <td><p id='row3col4'>300</p></td>\
    #               <td><p id='row3col5'>300</p></td>\
    #               <td><p id='row3col6'>300</p></td>\
    #             </tr>\
    #             <tr>\
    #               <td><p id='row4col1'>400</p></td>\
    #               <td><p id='row4col2'>400</p></td>\
    #               <td><p id='row4col3'>400</p></td>\
    #               <td><p id='row4col4'>400</p></td>\
    #               <td><p id='row4col5'>400</p></td>\
    #               <td><p id='row4col6'>400</p></td>\
    #             </tr>\
    #             <tr>\
    #               <td><p id='row5col1'>500</p></td>\
    #               <td><p id='row5col2'>500</p></td>\
    #               <td><p id='row5col3'>500</p></td>\
    #               <td><p id='row5col4'>500</p></td>\
    #               <td><p id='row5col5'>500</p></td>\
    #               <td><p id='row4col6'>500</p></td>\
    #             </tr>\
    #             </tbody>\
    #           </table>"

# takes as input for construction
# question : str of question being asked
# answer: str of answer to that question
# value: int of points assigned to that question
class JeopardyQuestion():
    def __init__(self, question, answer, value):
        self.question = question
        self.answer = answer
        self.value = value
        self.answered = False

    def validate_answer(self, given):
        return self.answer.lower() == given.lower()

# this class is of the jeopardy board for the current game
# questions: dictionary of string to lsit of jeopardy questions
# categories: list of strings currently used
class JeopardyBoard():
    def __init__(self, questions, categories):
        self.questions = questions
        self.categories = categories

class JeopardyGame():
    def __init__(self, players):
        self.players = players
        self.scores = {player:0 for player in players}
        self.curr_player = players[0]
        self.board = make_new_board(1)
        self.spins_remaining = 50
    
# when the first request is sent, a new jeopardy board is created
# as well as a new ID for the players sent in the request



@APP.get("/")
def read_root():
    return {"Hello": "World"}


@APP.get("/login/")
def read_root():
    return {"Hello": "World"}

@APP.post("/setup/")
async def setup(request: Request):
    print(vars(request))
    body = await request.body()
    print(body)
    # we need to create a new id to send back for future uses
    # also need to put this id in the cache mapping to the 
    # game state

    if (
        not request.session.get("uid") or
        not request.session.get("uid") in GLOBAL_CACHE
    ):
        print("leaving lol")
        board = get_board_html()
        return {"board": board, "players": ["Tom", "Jerry"]}
    
    return SubmitResult(
        success=True,
        overwrite="",
        message=""
    )


if __name__ == '__main__':
    print(f"Listening to port {PORT}")
    board = make_new_board(1)
    print(board)
    print(get_board_html(board))
    # uvicorn.run(APP, host='0.0.0.0', port=PORT)