import os
import streamlit as st
from rag_pipeline import predict_disease

st.set_page_config(page_title="Plant Disease RAG", page_icon="🌱")

st.title("🌱 Plant Disease Prediction (RAG)")

crop = st.text_input("Enter crop name")
symptoms = st.text_area("Describe symptoms")

if st.button("Predict Disease"):
    if crop and symptoms:
        with st.spinner("Analyzing..."):
            result = predict_disease(crop, symptoms)
        st.success("Prediction Result")
        st.write(result)
    else:
        st.warning("Please enter both crop name and symptoms.")
