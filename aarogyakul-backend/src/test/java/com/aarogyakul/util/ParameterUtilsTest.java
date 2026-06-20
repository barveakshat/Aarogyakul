package com.aarogyakul.util;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ParameterUtilsTest {
    @Test
    void canonicalizesKnownSynonyms() {
        assertThat(ParameterUtils.canonicalize("Glycated Hemoglobin")).isEqualTo("HbA1c");
        assertThat(ParameterUtils.canonicalize("LDL Cholesterol")).isEqualTo("LDL");
        assertThat(ParameterUtils.canonicalize("Fasting Blood Glucose")).isEqualTo("Blood Glucose (Fasting)");
    }

    @Test
    void preservesUnknownNames() {
        assertThat(ParameterUtils.canonicalize("Serum Calcium")).isEqualTo("Serum Calcium");
    }
}
