# extensions.py
from flask_bcrypt import Bcrypt
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager

# Create the shared instances
bcrypt = Bcrypt()
mongo = PyMongo()
jwt = JWTManager()
