import streamlit as st
import matplotlib.pyplot as plt
import numpy as np

st.title("Parametric Heart")

a = 1.5
b = 1.0
t = np.linspace(0, 2 * np.pi, 1000)

r = a * (1 - b * np.sin(t))
x = r * np.cos(t)
y = r * np.sin(t)

fig, ax = plt.subplots(figsize=(6, 6))
ax.plot(x, y, color="red")
ax.set_aspect("equal")

st.pyplot(fig)
plt.close(fig)
