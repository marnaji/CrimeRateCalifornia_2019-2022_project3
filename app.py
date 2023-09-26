# flask object
# import the render_template() helper function that lets you render HTML template 
import sqlite3
from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)
 

#function is defined to convert sqlite3.Row objects to dictionaries.
def dict_factory(cursor, row):
    """Converts sqlite3.Row objects to dictionaries."""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    conn = sqlite3.connect('CaliCrime.sqlite')
    conn.row_factory = dict_factory  # Use the dict_factory to get dictionaries instead of sqlite3.Row
    return conn


@app.route('/data')
def getData():
    conn = get_db_connection()
    conn.execute('PRAGMA case_sensitive_like=ON')  # Enable case sensitivity if needed
    crimes = conn.execute('SELECT * FROM Crimes').fetchall()
    conn.close()  # Close the database connection

    # Convert the list of dictionaries to JSON
    return jsonify(crimes)



@app.route('/topCounties')
def getCounties():
    conn = get_db_connection()
    conn.execute('PRAGMA case_sensitive_like=ON')  # Enable case sensitivity if needed
    county_names = conn.execute('SELECT DISTINCT county FROM Crimes ORDER BY county_pop DESC LIMIT 7').fetchall()
    conn.close()  # Close the database connection

    # Convert the list of dictionaries to JSON
    return jsonify(county_names)

@app.route('/calimap')
def getMap():
    return render_template('calimap.html')


@app.route('/')
#index function returns the result of index.html as an argument
def index():
    conn = get_db_connection()
    crimes = conn.execute('SELECT * FROM Crimes').fetchall()
    json_string = json.dumps(crimes, default=str) 
    return render_template('index.html', posts=json_string)

# redirect to readme page 
@app.route('/readMe')
def readMe():
    return "https://github.com/marnaji/project3/blob/main/README.md"
