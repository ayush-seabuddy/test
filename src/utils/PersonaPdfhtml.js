export const generateHtmlContent = (insights, mbtiType, fullName) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${mbtiType} Personality Map Result</title>
        <style>
          body { font-family: Poppins, sans-serif; margin: 20px; background: #ffffff; padding: 30px; }
          .header { 
            display: flex; 
            flex-direction: row; 
            justify-content: space-between; 
            align-items: center; 
            background: #fff; 
            padding: 10px 10px; 
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
            width: 100%; 
          }          
          .logo-container { display: flex; align-items: center}
          .logo-image { width: 170px; height: auto; }
          .header .date { font-size: 10px; color: #555; margin-left: 360px; }
          h1, h2, h3, h4 { color: #06361F; }
          h3 { font-style: incline; }
          .section { margin-bottom: 12px; }
          .section-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #06361F; }
          .section-content { font-size: 12px; line-height: 1.3; }
          ul { list-style-type: disc; margin-left: 20px; }
          .highlight { font-weight: bold; color: #06361F; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="https://res.cloudinary.com/daz8utdju/image/upload/v1737473065/1737473062730_Group5_nwe7fp.png" alt="SeaBuddy" class="logo-image" />
          </div>
          <div class="date">Generated Date: ${new Date().toLocaleDateString()}</div>
        </div>

        <h3>${mbtiType} Personality Map Result of ${fullName}</h3>
        <h5>(${insights.big_five_type_full})<h5>

        <div class="section">
          <h4 class="section-title">Famous Individuals</h4>
          <ul class="section-content">
            ${(insights.famous_individuals &&
            Array.isArray(insights.famous_individuals)
              ? insights.famous_individuals
              : []
            )
              .map((name) => `<li>${name}</li>`)
              .join("")}
          </ul>
        </div>

        

        <div class="section">
          <h4 class="section-title">Personality Traits</h4>
           <ul class="section-content">
        ${(insights.personality_traits && typeof insights.personality_traits === "object"
          ? Object.entries(insights.personality_traits).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
          : []
        )
          .join("")}
      </ul>
        </div>

        <div class="section">
          <h4 class="section-title">Career Path</h4>
            ${(insights.career_path && typeof insights.career_path === "object"
          ? Object.entries(insights.career_path).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
          : []
        )
          .join("")}
        </div>

        <div class="section">
          <h4 class="section-title">Red Flags and Recommendations</h4>
          <ul class="section-content">
            ${(insights.red_flags && Array.isArray(insights.red_flags)
              ? insights.red_flags
              : []
            )
              .map(
                (flag, index) => `
              <li>
                <span class="highlight">Challenge:</span> ${flag}
                <br>
                <span class="highlight">Recommendation:</span> ${
                  insights.corrective_actions &&
                  Array.isArray(insights.corrective_actions) &&
                  insights.corrective_actions[index]
                    ? insights.corrective_actions[index].recommendation
                    : "N/A"
                }
                <br>
                <span class="highlight">Expected Outcome:</span> ${
                  insights.corrective_actions &&
                  Array.isArray(insights.corrective_actions) &&
                  insights.corrective_actions[index]
                    ? insights.corrective_actions[index].expected_outcome
                    : "N/A"
                }
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <div class="section">
          <h4 class="section-title">Compatible Crew Mates</h4>
          <ul class="section-content">
            ${(insights.compatible_crew_mates &&
            Array.isArray(insights.compatible_crew_mates)
              ? insights.compatible_crew_mates
              : []
            )
              .map(
                (mate) => `
              <li>
                <strong>${mate.fullName}</strong> (${mate.email})
                <br>
                <a href="${mate.profileUrl}" target="_blank">View Profile</a>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      </body>
      </html>
      `;
};

export const generatePDFContent = (insights, mbtiType, fullName) => {
  const dateGenerated = new Date().toLocaleDateString();

  // Define content for PDFMake
  const content = [
    {
      columns: [
        {
          image:
            "https://res.cloudinary.com/daz8utdju/image/upload/v1737473065/1737473062730_Group5_nwe7fp.png",
          width: 100,
        },
        {
          text: `Generated Date: ${dateGenerated}`,
          alignment: "right",
          fontSize: 10,
        },
      ],
    },
    {
      text: `${mbtiType} Personality Map Result of ${fullName}`,
      style: "header",
    },
    {
      text: "Famous Individuals",
      style: "sectionHeader",
    },
    {
      ul: insights.famous_individuals || [],
      style: "list",
    },
    {
      text: "Compatibility",
      style: "sectionHeader",
    },
    {
      ul: insights.compatibility || [],
      style: "list",
    },
    {
      text: "Personality Traits",
      style: "sectionHeader",
    },
    {
      ul: insights.personality_traits || [],
      style: "list",
    },
    {
      text: "Career Path",
      style: "sectionHeader",
    },
    {
      ul: insights.career_path || [],
      style: "list",
    },
    {
      text: "Red Flags and Recommendations",
      style: "sectionHeader",
    },
    {
      ul: (insights.red_flags || []).map((flag, index) => ({
        text: [
          { text: "Challenge: ", bold: true },
          flag,
          "\n",
          { text: "Recommendation: ", bold: true },
          insights.corrective_actions?.[index]?.recommendation || "N/A",
          "\n",
          { text: "Expected Outcome: ", bold: true },
          insights.corrective_actions?.[index]?.expected_outcome || "N/A",
          "\n",
        ],
      })),
    },
    {
      text: "Compatible Crew Mates",
      style: "sectionHeader",
    },
    {
      ul: (insights.compatible_crew_mates || []).map((mate) => ({
        text: [
          { text: `${mate.fullName} `, bold: true },
          `(${mate.email})`,
          "\n",
          {
            text: "View Profile",
            link: mate.profileUrl,
            decoration: "underline",
          },
        ],
      })),
    },
  ];

  // Define styles
  const styles = {
    header: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 10],
    },
    sectionHeader: {
      fontSize: 12,
      bold: true,
      margin: [0, 10, 0, 5],
    },
    list: {
      fontSize: 10,
      margin: [0, 5, 0, 5],
    },
  };

  return { content, styles };
};
