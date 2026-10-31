Parametric Heart

Interactive Math Visualizer

A small Python app for exploring how mathematical parameters change the size, shape, and symmetry of curves.

Motivation

With a background in fine arts, I wanted to connect my independent math study with a more visual way of learning. This project lets me change a variable and compare the resulting curve with the equation.

Features

* Switch between heart and rose curves.
* Adjust a to change the size.
* Adjust b to change the heart’s shape or the rose’s frequency.
* View the equations alongside the curves.

Try It

Open Parametric Heart

Try the heart curve with b = 0, 1, and 1.5. Then compare rose curves with b = 2 and 3.

How It Works

NumPy samples angles between zero and a full turn. The app calculates the curve’s coordinates, draws them with Matplotlib, and updates the plot through Streamlit.

Heart family: r = a(1 − b sin t)

Rose curves: r = a cos(bt)

Both use x = r cos t and y = r sin t.

Run Locally

pip install -r requirements.txt
streamlit run app.py

This prototype supports two predefined curve families.
