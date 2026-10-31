import streamlit as st
import matplotlib.pyplot as plt
import numpy as np

st.title("Parametric Heart")

a = st.sidebar.slider("a · Size", 0.5, 3.0, 1.5, 0.1)
b = st.sidebar.slider("b · Shape", 0.0, 2.0, 1.0, 0.05)

st.latex(r"r = a(1-b\sin t)")
st.latex(r"x = r\cos t,\qquad y = r\sin t")

t = np.linspace(0, 2 * np.pi, 1000)
r = a * (1 - b * np.sin(t))
x = r * np.cos(t)
y = r * np.sin(t)

fig, ax = plt.subplots(figsize=(6, 6))
fig.patch.set_facecolor("#101018")
ax.set_facecolor("#101018")
ax.plot(x, y, color="#FF3864", linewidth=2.5)

# Keep the view fixed so size changes stay visible.
ax.set_xlim(-9.5, 9.5)
ax.set_ylim(-9.5, 9.5)
ax.set_aspect("equal")
ax.axis("off")
fig.tight_layout(pad=0)

st.pyplot(fig)
plt.close(fig)
