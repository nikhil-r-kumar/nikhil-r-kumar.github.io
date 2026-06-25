import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ResumeProfile = {
  id: string;
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  summary: string;
  skills: string[];
  experience: Array<{
    role: string;
    company: string;
    period: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    period: string;
  }>;
  certifications: string[];
};

@Component({  
  selector: 'app-resume',
  imports: [CommonModule, FormsModule],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
})
export class Resume {
  selectedProfileId = 'aarav-sharma';
  isEditing = false;
  formMessage = '';

  profiles: ResumeProfile[] = [
    {
      id: 'aarav-sharma',
      name: 'Aarav Sharma',
      title: 'Senior Frontend Engineer | Angular & Design Systems',
      location: 'Bengaluru, India',
      email: 'aarav.sharma@email.com',
      phone: '+91 98765 43210',
      website: 'linkedin.com/in/aaravsharma',
      summary: 'Frontend engineer with 7+ years of experience building scalable, accessible web applications for SaaS and product teams.',
      skills: [
        'Angular',
        'TypeScript',
        'Node.js',
      ],
      experience: [
        {
          role: 'Senior Frontend Engineer',
          company: 'Productive AI Labs',
          period: '2022 – Present',
          bullets: [
            'Led the frontend architecture for a multi-tenant analytics platform used by enterprise customers.',
            'Built reusable Angular components and a shared design system that reduced delivery time across teams.',
            'Improved Lighthouse scores and accessibility compliance for critical product journeys.',
          ],
        },
        {
          role: 'Frontend Developer',
          company: 'BrightEdge Tech',
          period: '2019 – 2022',
          bullets: [
            'Developed responsive web dashboards and customer portals for B2B SaaS products.',
            'Worked closely with product and design to launch new features with a focus on usability and speed.',
            'Introduced unit testing and component standards that elevated code quality across releases.',
          ],
        },
      ],
      education: [
        {
          degree: 'B.Tech in Computer Science',
          institution: 'IIT Hyderabad',
          period: '2015 – 2019',
        },
      ],
      certifications: ['Google UX Design Certificate', 'Angular Advanced Practices'],
    },
  ];

  get selectedProfile(): ResumeProfile {
    return (
      this.profiles.find(profile => profile.id === this.selectedProfileId) ?? this.profiles[0]
    );
  }

  selectProfile(profileId: string): void {
    this.selectedProfileId = profileId;
  }

  startEditing(): void {
    this.isEditing = true;
    this.formMessage = '';
  }

  saveProfile(): void {
    this.isEditing = false;
    this.formMessage = 'Resume details updated.';
  }

  addExperience(): void {
    this.selectedProfile.experience.push({
      role: '',
      company: '',
      period: '',
      bullets: [''],
    });
  }

  addEducation(): void {
    this.selectedProfile.education.push({
      degree: '',
      institution: '',
      period: '',
    });
  }

  addCertification(): void {
    this.selectedProfile.certifications.push('');
  }

  addSkill(): void {
    this.selectedProfile.skills.push('');
  }

  updateBullets(event: string, jobIndex: number): void {
    this.selectedProfile.experience[jobIndex].bullets = event
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  printResume(): void {
    window.print();
  }
}

