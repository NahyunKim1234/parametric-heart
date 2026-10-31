import streamlit as st
import matplotlib.pyplot as plt
import numpy as np

st.set_page_config(page_title="Parametric Heart", page_icon="❤️")
st.title("Parametric Heart")
st.caption("Interactive Math Visualizer")

curve = st.sidebar.selectbox("Curve", ["Heart", "Rose"])
a = st.sidebar.slider("a · Size", 0.5, 3.0, 1.5, 0.1)

if curve == "Heart":
    b = st.sidebar.slider("b · Shape", 0.0, 2.0, 1.0, 0.05)
else:
    b = st.sidebar.slider("b · Frequency", 1, 10, 5)

# Calculate the curve.
t = np.linspace(0, 2 * np.pi, 2000)

if curve == "Heart":
    r = a * (1 - b * np.sin(t))
    st.latex(r"r = a(1-b\sin t)")
else:
    r = a * np.cos(b * t)
    st.latex(r"r = a\cos(bt)")

x = r * np.cos(t)
y = r * np.sin(t)
st.latex(r"x = r\cos t,\qquad y = r\sin t")

# Draw without axes.
fig, ax = plt.subplots(figsize=(6, 6))
fig.patch.set_facecolor("#101018")
ax.set_facecolor("#101018")
ax.plot(x, y, color="#FF3864", linewidth=2.5)

limit = 9.5 if curve == "Heart" else 3.3
ax.set_xlim(-limit, limit)
ax.set_ylim(-limit, limit)
ax.set_aspect("equal")
ax.axis("off")
fig.tight_layout(pad=0)

st.pyplot(fig)
plt.close(fig)
