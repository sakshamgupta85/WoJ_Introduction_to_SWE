import os
from pickle import GLOBAL
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
import copy

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
            # print("pls be a tuple: ", q_a)
            q = q_a[0]
            a = q_a[1]
            to_app = JeopardyQuestion(q,a,curr_points)
            to_map.append(to_app)
            curr_points += update
        questions[cat] = to_map
    # print(questions)
    # print(to_draw)
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

def get_scores_html(scores):
    players = sorted(scores.keys())
    to_return = "<p>"
    for player in players:
        to_return += "Player " + player + " has scored " + str(scores[player]) + " points. "
    to_return += "</p>"

    return to_return

def get_players_html(players):
    return ""


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

    def reward_guess(self, guess):
        if self.validate_answer(guess):
            return self.value
        else:
            return -1 * self.value

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
        self.spins_remaining = 5
        self.curr_question = None
    def next_player(self):
        if self.curr_player == self.players[0]:
            self.curr_player = self.players[1]
        else:
            self.curr_player = self.players[0]
# when the first request is sent, a new jeopardy board is created
# as well as a new ID for the players sent in the request
def spin_and_update(board):
    cats = list(range(len(board.categories)))
    random.shuffle(cats)
    for rand_cat_ind in cats:
        rand_cat = board.categories[rand_cat_ind]
        i = 0
        for q in board.questions[rand_cat]:
            if not q.answered:
                # q.answered = True
                new_q = q
                new_q.answered = True
                board.questions[rand_cat][i] = new_q
                return (board, q)
            else:
                i += 1
    return None, None
    


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
        # hardcoded but this needs to be updated later
        curr_game = JeopardyGame(["Tom", "Jerry"])
        server_board = curr_game.board#make_new_board(1)
        board = get_board_html(server_board)
        new_id =  str(uuid.uuid4())
        GLOBAL_CACHE[new_id] = curr_game
        currently_playing = "<p>Currently playing : Tom, Jerry</p>"
        scores = get_scores_html(curr_game.scores)
        return {"board": board, "players": currently_playing, "uid": new_id, "scores":scores, "spins_rem": curr_game.spins_remaining}
    
    return None

@APP.post("/spin/")
async def spin(request: Request):
    print(vars(request))
    body = await request.body()
    print("how do i get uid : ", body)
    # we need to create a new id to send back for future uses
    # also need to put this id in the cache mapping to the 
    # game state

    if (
        not request.session.get("uid") or
        not request.session.get("uid") in GLOBAL_CACHE
    ):
        curr_id = str(body.decode("utf-8"))[1:-1]
        print(curr_id)
        a = "string"
        print(a)
        print(GLOBAL_CACHE)
        curr_game = GLOBAL_CACHE[curr_id]
        curr_board = curr_game.board
        server_board, curr_q = spin_and_update(curr_board)
        if not server_board:
            server_board = make_new_board(2)
            server_board, curr_q = spin_and_update(server_board)
        board = get_board_html(server_board)
        curr_game.board = server_board
        curr_game.curr_question = curr_q
        curr_game.spins_remaining -= 1
        currently_playing = "<p>Currently playing : Tom, Jerry</p>"
        curr_scores = get_scores_html(curr_game.scores)
        GLOBAL_CACHE[curr_id] = curr_game
        return {"board": board, "players": currently_playing, "uid": curr_id, "curr_q": curr_q.question,\
             "scores":curr_scores, "spins_rem": curr_game.spins_remaining}
    
    return None


@APP.post("/guess/")
async def guess(request: Request):
    print(vars(request))
    body = await request.body()
    split = body.decode("utf-8").split(",")
    id, guess = split[0], split[1]
    print("how do i get uid : ", body)
    # we need to create a new id to send back for future uses
    # also need to put this id in the cache mapping to the 
    # game state


    # the user has submitted a guess
    # we want to validate it using the current question
    # assign the proper scores
    # and return the resulting board, scores, result, etc.

    if (
        not request.session.get("uid") or
        not request.session.get("uid") in GLOBAL_CACHE
    ):
        curr_id = id[2:-1]#str(id.decode("utf-8"))[1:-1]
        print(curr_id)
        a = "string"
        print(a)
        print(GLOBAL_CACHE)
        curr_game = GLOBAL_CACHE[curr_id]
        curr_board = curr_game.board
        curr_question = curr_game.curr_question
        print("quesrion : ", curr_question.question)
        guess = guess[1:-2]
        print("they guessed : ", guess)
        # they placed a guess
        # let's validate it with the current question
        # and then let's update teh scores accordingly
        # and send the response to the frontend
        # server_board, curr_q = spin_and_update(curr_board)
        board = get_board_html(curr_board)
        
        currently_playing = "<p>Currently playing : Tom, Jerry</p>"
        score_reward = curr_question.reward_guess(guess)
        curr_scores = curr_game.scores
        curr_player = curr_game.curr_player
        curr_game.next_player()
        curr_scores[curr_player] += score_reward

        curr_scores_resp = get_scores_html(curr_scores)
        if curr_game.spins_remaining == 0:
            if curr_scores[curr_game.players[0]] > curr_scores[curr_game.players[1]]:
                winner = curr_game.players[0]
            else:
                winner = curr_game.players[1]
            return {"game_over": True, "winner": winner}
        GLOBAL_CACHE[curr_id] = curr_game
        return {"board": board, "players": currently_playing, "uid": curr_id, "curr_q": curr_question.question, \
            "scores":curr_scores_resp, "spins_rem": curr_game.spins_remaining}
    
    return None





if __name__ == '__main__':
    print(f"Listening to port {PORT}")
    board = make_new_board(1)
    print(board)
    print(get_board_html(board))
    uvicorn.run(APP, host='0.0.0.0', port=PORT)